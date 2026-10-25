from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Invitacion, InvitacionHistorico, RegistroAcceso
from .serializers import InvitacionFrontendSerializer


class InvitacionViewSet(viewsets.ModelViewSet):
    queryset = Invitacion.objects.select_related('invitado', 'punto_acceso', 'socio').all().order_by('-fecha_creacion')
    serializer_class = InvitacionFrontendSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        solo_activas = self.request.query_params.get('activas')
        if solo_activas == 'true':
            qs = qs.filter(usada_en__isnull=True)
        return qs

    @action(detail=True, methods=['POST', 'PUT'])
    def usar(self, request, pk=None):
        """Marca una invitación como usada (ingreso por QR) y guarda trazabilidad en InvitacionHistorico."""
        invitacion = self.get_object()
        ahora = timezone.now()
        invitacion.usada_en = ahora
        invitacion.save()

        InvitacionHistorico.objects.create(
            invitado=invitacion.invitado,
            socio=invitacion.socio,
            punto_acceso=invitacion.punto_acceso,
            fecha_creacion=invitacion.fecha_creacion,
            fecha_inicio=invitacion.fecha_inicio,
            fecha_visita=invitacion.fecha_visita,
            fecha_fin=ahora,
            dias_habilitados=invitacion.dias_habilitados,
            estado='recepcionado',
            tipo=invitacion.tipo,
        )
        serializer = self.get_serializer(invitacion)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='registrar-egreso')
    def registrar_egreso(self, request):
        """Registra el egreso de una lista de DNIs desde la pantalla del Guardia."""
        dnis = request.data.get('dnis', [])
        if not isinstance(dnis, list) or not dnis:
            return Response({'detail': 'Debe enviar una lista de DNIs.'}, status=status.HTTP_400_BAD_REQUEST)

        ahora = timezone.now()
        registros = []
        for dni in dnis:
            dni_str = str(dni).strip()
            reg = RegistroAcceso.objects.create(
                dni=dni_str,
                tipo_movimiento='egreso',
                hora_desde=ahora.time(),
                hora_hasta=ahora.time(),
                valido_desde=ahora,
                valido_hasta=ahora,
            )
            registros.append(reg.id)

        return Response({
            'status': 'ok',
            'cantidad': len(registros),
            'mensaje': f'Se registraron {len(registros)} egresos correctamente en la base de datos.'
        }, status=status.HTTP_201_CREATED)
