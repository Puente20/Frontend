import os

from django.db import transaction
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from administracion.models import Account
from .models import AlertaPanico


def autorizado(user, rol):
    return (user.is_authenticated and user.is_active and
            Account.objects.filter(user=user, role=rol, is_active=True).exists())


class PanicoView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not autorizado(request.user, 'socio'):
            return Response({'detail': 'Solo un socio puede enviar una emergencia.'}, status=403)

        # Los ZIP originales no relacionan Account con Socio ni Lote.
        # Estos datos corresponden SOLO a la cuenta de socio de prueba del .env.
        if request.user.username != os.getenv('DEMO_SOCIO_USERNAME', '').strip():
            return Response({'detail': 'El socio no tiene datos de emergencia configurados.'}, status=409)

        nombre = os.getenv('PANICO_SOCIO_NOMBRE_COMPLETO', '').strip()
        lote = os.getenv('PANICO_SOCIO_LOTE', '').strip()
        telefono = os.getenv('PANICO_SOCIO_TELEFONO', '').strip()
        if not all((nombre, lote, telefono)):
            return Response({'detail': 'Faltan nombre, lote o teléfono del socio en el .env.'}, status=409)

        alerta = AlertaPanico.objects.create(
            socio=request.user, nombre_completo=nombre,
            numero_lote=lote, telefono=telefono,
        )
        return Response({'id': alerta.pk, 'status': 'ok',
                         'mensaje': 'Emergencia registrada y disponible para el guardia.'}, status=201)


class PanicoPendientesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not autorizado(request.user, 'guardia'):
            return Response({'detail': 'Solo el guardia puede consultar emergencias.'}, status=403)
        alertas = AlertaPanico.objects.filter(
            estado=AlertaPanico.Estado.PENDIENTE
        )[:100]
        return Response({'alertas': [
            {
                'id': a.pk,
                'nombre_completo': a.nombre_completo,
                'numero_lote': a.numero_lote,
                'telefono': a.telefono,
            }
            for a in alertas
        ]})


class PanicoResolverView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, alerta_id):
        if not autorizado(request.user, 'guardia'):
            return Response({'detail': 'Solo el guardia puede resolver emergencias.'}, status=403)
        estados = {
            'enviar_movil': AlertaPanico.Estado.ATENDIDA,
            'rechazar': AlertaPanico.Estado.RECHAZADA,
        }
        accion = request.data.get('accion')
        if accion not in estados:
            return Response({'detail': 'Acción inválida.'}, status=400)

        # Evita resolver dos veces la misma emergencia si hay varios guardias.
        with transaction.atomic():
            cantidad = AlertaPanico.objects.filter(
                pk=alerta_id, estado=AlertaPanico.Estado.PENDIENTE,
            ).update(
                estado=estados[accion], guardia=request.user,
                resuelta_en=timezone.now(),
            )
            if not cantidad:
                if not AlertaPanico.objects.filter(pk=alerta_id).exists():
                    return Response({'detail': 'Emergencia no encontrada.'}, status=404)
                return Response({'detail': 'Esta emergencia ya fue resuelta.'}, status=409)

        mensaje = ('Emergencia atendida.' if accion == 'enviar_movil'
                   else 'Emergencia rechazada.')
        return Response({'estado': estados[accion], 'mensaje': mensaje})
