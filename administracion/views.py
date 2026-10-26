from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from base.views import ActiveViewSet
from .models import Lote, PuntoAcceso, Socio, Account
from .serializers import LoteSerializer, PuntoAccesoSerializer, SocioSerializer


class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all().order_by('numero')
    serializer_class = LoteSerializer


class PuntoAccesoViewSet(viewsets.ModelViewSet):
    queryset = PuntoAcceso.objects.all()
    serializer_class = PuntoAccesoSerializer


class SocioViewSet(ActiveViewSet):
    queryset = Socio.all_objects.select_related('lote').all().order_by('id')
    serializer_class = SocioSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        tipo = self.request.query_params.get('tipo')
        if tipo in ('propietario', 'inquilino'):
            qs = qs.filter(tipo=tipo)
        return qs

    @action(detail=False, methods=['GET'])
    def propietarios(self, request):
        qs = self.get_queryset().filter(tipo='propietario')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def inquilinos(self, request):
        qs = self.get_queryset().filter(tipo='inquilino')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Autentica cuentas registradas según el rol solicitado.
    """
    identificador = (
        request.data.get('identificador')
        or request.data.get('email')
        or request.data.get('username')
        or ''
    ).strip()
    password = request.data.get('password') or ''
    if not identificador or not password:
        return Response(
            {'detail': 'El correo electrónico y la contraseña son obligatorios.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    rol_solicitado = request.data.get('rol', 'administrador')

    mapa_roles = {
        'administrador': 'admin',
        'residente': 'socio',
        'guardia': 'guardia',
        'admin': 'admin',
        'socio': 'socio',
    }
    role_code = mapa_roles.get(rol_solicitado)
    if not role_code:
        return Response(
            {'detail': 'El rol solicitado no es válido.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_obj = User.objects.filter(email__iexact=identificador).first()
    if not user_obj and role_code == 'guardia':
        user_obj = User.objects.filter(username__iexact=identificador).first()
    if not user_obj:
        return Response(
            {'detail': 'La información de inicio de sesión es incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    account = Account.all_objects.filter(user=user_obj, role=role_code).first()
    if not account:
        return Response(
            {'detail': 'La información de inicio de sesión es incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if not user_obj.is_active or not account.is_active:
        return Response(
            {'detail': 'La información de inicio de sesión es incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = authenticate(username=user_obj.username, password=password)
    if not user:
        return Response(
            {'detail': 'La información de inicio de sesión es incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    socio = Socio.objects.filter(account=account).first() if role_code == 'socio' else None
    if role_code == 'socio' and not socio:
        return Response(
            {'detail': 'La información de inicio de sesión es incorrecta'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name or user.username,
            'last_name': user.last_name,
            'email': user.email,
            'rol': rol_solicitado,
            'role_code': account.role,
            'socio_id': socio.id if socio else None,
            'lote': socio.lote.numero if (socio and socio.lote) else 1,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def recuperar_contrasena_view(request):
    correo = (request.data.get('correo') or request.data.get('email') or '').strip()
    if not correo:
        return Response({'detail': 'El correo electrónico es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        'status': 'ok',
        'mensaje': f'Se notificó a la administración para restablecer la contraseña de {correo}.'
    })
