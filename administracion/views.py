from rest_framework import status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from base import AccountRole
from base.permissions import ClavePendiente, IsAdminRole
from . import models, serializers, services


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = AuthTokenSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    return Response(services.datos_login(serializer.validated_data['user']))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cambiar_clave(request):
    serializer = serializers.PasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    token = services.cambiar_clave(request.user, serializer.validated_data['password'])
    return Response({'token': token})


class AccountViewSet(ModelViewSet):
    queryset = models.Account.objects.all()
    serializer_class = serializers.AccountSerializer
    permission_classes = [IsAdminRole, ClavePendiente]

    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        serializer = serializers.PasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.resetear_clave(self.get_object(), serializer.validated_data['password'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class SocioViewSet(ModelViewSet):
    queryset = models.Socio.objects.all()
    serializer_class = serializers.SocioSerializer
    permission_classes = [IsAdminRole, ClavePendiente]

    @action(detail=True, methods=['post'], url_path='create_account')
    def create_account(self, request, pk=None):
        serializer = serializers.PasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        socio = services.crear_cuenta(
            self.get_object(),
            serializer.validated_data['password'],
            AccountRole.socio,
        )
        return Response(self.get_serializer(socio).data, status=status.HTTP_201_CREATED)


class GuardiaViewSet(ModelViewSet):
    queryset = models.Guardia.objects.all()
    serializer_class = serializers.GuardiaSerializer
    permission_classes = [IsAdminRole, ClavePendiente]

    @action(detail=True, methods=['post'], url_path='create_account')
    def create_account(self, request, pk=None):
        serializer = serializers.PasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guardia = services.crear_cuenta(
            self.get_object(),
            serializer.validated_data['password'],
            AccountRole.guardia,
        )
        return Response(self.get_serializer(guardia).data, status=status.HTTP_201_CREATED)


class AdministradorViewSet(ModelViewSet):
    queryset = models.Administrador.objects.all()
    serializer_class = serializers.AdministradorSerializer
    permission_classes = [IsAdminRole, ClavePendiente]


class ProveedorViewSet(ModelViewSet):
    queryset = models.Proveedor.objects.all()
    serializer_class = serializers.ProveedorSerializer
    permission_classes = [IsAdminRole, ClavePendiente]


class LoteViewSet(ModelViewSet):
    queryset = models.Lote.objects.all()
    serializer_class = serializers.LoteSerializer
    permission_classes = [IsAdminRole, ClavePendiente]


class PuntoAccesoViewSet(ModelViewSet):
    queryset = models.PuntoAcceso.objects.all()
    serializer_class = serializers.PuntoAccesoSerializer
    permission_classes = [IsAdminRole, ClavePendiente]
