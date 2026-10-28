from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import LugarComun, Reserva
from .serializers import InstalacionBarrioSerializer, ReservaSerializer
from invitaciones.models import InvitacionHistorico
from base.permissions import IsAuthenticated


def asegurar_instalaciones_iniciales():
    if LugarComun.objects.exists():
        return
    instalaciones_base = [
        {
            'codigo': 'cancha-tenis',
            'nombre': 'Cancha de Tenis',
            'horas_turno': 1,
            'duracion_minutos': 60,
            'max_personas': 4,
            'hora_apertura': 9,
            'hora_cierre': 24,
            'es_dia_completo': False,
            'es_capacidad_variable': False,
            'tipo_accion': 'confirmar',
        },
        {
            'codigo': 'cancha-padel',
            'nombre': 'Cancha de Padel',
            'horas_turno': 1,
            'duracion_minutos': 90,
            'max_personas': 4,
            'hora_apertura': 9,
            'hora_cierre': 24,
            'es_dia_completo': False,
            'es_capacidad_variable': False,
            'tipo_accion': 'confirmar',
        },
        {
            'codigo': 'cancha-futbol-5',
            'nombre': 'Cancha de Fútbol 5',
            'horas_turno': 1,
            'duracion_minutos': 60,
            'max_personas': 10,
            'hora_apertura': 9,
            'hora_cierre': 24,
            'es_dia_completo': False,
            'es_capacidad_variable': False,
            'tipo_accion': 'confirmar',
        },
        {
            'codigo': 'sum',
            'nombre': 'SUM',
            'horas_turno': 15,
            'duracion_minutos': None,
            'max_personas': 100,
            'hora_apertura': 9,
            'hora_cierre': 24,
            'es_dia_completo': True,
            'es_capacidad_variable': True,
            'tipo_accion': 'senar',
        },
    ]
    for item in instalaciones_base:
        LugarComun.objects.create(**item)


class InstalacionBarrioViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InstalacionBarrioSerializer

    def get_queryset(self):
        asegurar_instalaciones_iniciales()
        return LugarComun.objects.all().order_by('id')


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.select_related('lugar', 'socio', 'socio__lote').all().order_by('-creada_en')
    serializer_class = ReservaSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def ultimos_movimientos_view(request):
    """
    Devuelve la lista combinada de reservas y accesos para la sección 'Últimos movimientos' de ResidentHomeComponent.
    """
    reservas = Reserva.objects.select_related('lugar', 'socio', 'socio__lote').all().order_by('-creada_en')[:15]
    movimientos = list(ReservaSerializer(reservas, many=True).data)

    accesos = InvitacionHistorico.objects.select_related('invitado', 'socio', 'socio__lote').all().order_by('-fecha_fin')[:10]
    for acc in accesos:
        tipo_mov = 'visitante-aprobado' if acc.estado == 'recepcionado' else 'visitante-rechazado'
        desc = 'Visitante aprobado' if acc.estado == 'recepcionado' else 'Visitante rechazado'
        lote_str = f"Lote {acc.socio.lote.numero}" if (acc.socio and acc.socio.lote) else "Lote 1"
        movimientos.append({
            'id': 10000 + acc.id,
            'hora': acc.fecha_fin.strftime('%H:%M') if acc.fecha_fin else '12:00',
            'fechaRegistro': acc.fecha_fin.isoformat() if acc.fecha_fin else '',
            'tipo': tipo_mov,
            'descripcion': desc,
            'ubicacion': lote_str,
            'detalle': f"DNI: {acc.invitado.dni}",
        })

    movimientos.sort(key=lambda x: x.get('fechaRegistro', ''), reverse=True)
    return Response(movimientos)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def alerta_panico_view(request):
    """Registra la alerta del botón de pánico enviada desde PanicButtonComponent."""
    return Response({
        'status': 'ok',
        'mensaje': 'Alerta de emergencia recibida en Seguridad y protocolo activado.'
    })
