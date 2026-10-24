from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from base import permissions
from . import models, serializers
from .services import InvitacionService, historial_de


class InvitacionViewSet(ModelViewSet):
    serializer_class = serializers.InvitacionSerializer
    permission_classes = [permissions.IsSocioRole, permissions.ClavePendiente]

    def get_queryset(self):
        return (
            models.Invitacion.objects
            .filter(socio=self.request.user.account.socio)
            .select_related('invitado', 'socio', 'punto_acceso')
        )

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return serializers.InvitacionViewSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        if self.action == 'validate':
            return [permissions.IsGuardiaRole(), permissions.ClavePendiente()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(socio=self.request.user.account.socio)

    @action(detail=False, methods=['post'], url_path='validate')
    def validate(self, request):
        serializer = serializers.InvitacionValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        historico = InvitacionService.recepcionar(serializer.validated_data['token_qr'])
        return Response(
            serializers.InvitacionHistoricoSerializer(historico).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='baja')
    def baja(self, request, pk=None):
        historico = InvitacionService.dar_de_baja(self.get_object().pk)
        return Response(
            serializers.InvitacionHistoricoSerializer(historico).data,
            status=status.HTTP_200_OK,
        )


class InvitadoViewSet(ModelViewSet):
    queryset = models.Invitado.objects.all()
    serializer_class = serializers.InvitadoSerializer
    permission_classes = [permissions.IsSocioRole, permissions.ClavePendiente]


@api_view(['GET'])
@permission_classes([permissions.IsSocioRole, permissions.ClavePendiente])
def historial(request):
    datos = historial_de(request.user.account.socio)
    data = {
        'invitaciones_activas': serializers.InvitacionActivaSerializer(
            datos['invitaciones_activas'], many=True,
        ).data,
        'invitaciones_recepcionadas': serializers.InvitacionHistoricoSerializer(
            datos['invitaciones_recepcionadas'], many=True,
        ).data
    }
    return Response(data)
