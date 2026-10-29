from django.http import StreamingHttpResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status, views

from base.permissions import IsGuardiaRole, IsAuthenticated, IsAdminRole
from .models import BotonPanico, AlertaState
from .serializers import AlertaValidation, AlertaSerializer
from .services import eventos

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def alerta_panico_view(request):
    """Registra la alerta del botón de pánico enviada."""
    data = request.data
    data['user'] = request.user
    serializer = AlertaValidation(request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'mensaje': 'Alerta de emergencia recibida en Seguridad y protocolo activado.'})
    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsGuardiaRole])
def stream(request):
    response = StreamingHttpResponse(
        eventos(),
        content_type='text/event-stream',
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

class AlertaRecepcionarView(views.APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsGuardiaRole]

    def put(self, request, pk):
        try:
            alerta = BotonPanico.objects.get(estado=AlertaState.enviada, pk=pk)
        except BotonPanico.DoesNotExist:
            return Response({"error": "La alerta no existe o ya se respondio"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            rechazada = request.data.get('rechazada')
            alerta.estado = AlertaState.confirmada
            if rechazada:
                motivo = request.data.get('motivo_rechazo')
                alerta.estado = AlertaState.rechazada
                alerta.motivo_rechazo = motivo
            alerta.save()
            return Response({'La alerta fue recepcionada'}, status=status.HTTP_200_OK)
        except Exception as e:
           return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST) 


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminRole])
def historico_alertas(request):
    queryset = BotonPanico.objects.all().select_related('socio', 'lote')
    serializer = AlertaSerializer(queryset, many=True)
    return Response(serializer.data)