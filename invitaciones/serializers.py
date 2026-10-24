import uuid
from rest_framework import serializers

from administracion.models import PuntoAcceso
from administracion.serializers import PuntoAccesoSerializer
from base.services import validar_dni_unico_api
from . import models, InvitacionTipo

class InvitadoSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = models.Invitado
        fields = ['nombre', 'apellido', 'dni', 'nombre_completo']

    def get_nombre_completo(self, obj):
        return obj.apellido_nombre()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        validar_dni_unico_api(
            attrs.get('dni', getattr(self.instance, 'dni', None)),
            self.instance,
        )
        return attrs


class InvitacionViewSerializer(serializers.ModelSerializer):
    invitado = InvitadoSerializer(read_only=True)
    socio = InvitadoSerializer(read_only=True)
    punto_acceso = InvitadoSerializer(read_only=True)
    tipo = serializers.ChoiceField(choices=InvitacionTipo.CHOICES)

    class Meta:
        model = models.Invitacion
        fields = ['id', 'invitado', 'socio', 'punto_acceso', 'fecha_creacion', 'fecha_inicio', 'fecha_fin', 'fecha_visita', 'dias_habilitados', 'tipo', 'token_qr']

class InvitacionSerializer(InvitacionViewSerializer):
    invitado = serializers.PrimaryKeyRelatedField(
        queryset = models.Invitado.objects.all(),
        write_only = True
    )
    punto_acceso = serializers.PrimaryKeyRelatedField(
        queryset = models.Invitado.objects.all(),
        write_only = True
    )
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField(required=False, allow_null=True)
    dias_habilitados = serializers.JSONField()
    tipo = serializers.ChoiceField(choices=InvitacionTipo.CHOICES)
    token_qr = serializers.UUIDField(read_only=True)

    class Meta:
        model = models.Invitacion
        fields = ['invitado', 'socio', 'punto_acceso', 'fecha_inicio', 'fecha_visita', 'dias_habilitados', 'tipo', 'token_qr']

    def validate(self, attrs):
        if attrs.get('tipo') == InvitacionTipo.recurrente:
            if not attrs.get('fecha_fin') or not attrs.get('dias_habilitados'):
                raise serializers.ValidationError('Para invitación recurrente se necesitan los dis habilitados y las fechas de inicio y fin')
        return attrs

    def create(self, validated_data):
        validated_data['token_qr'] = uuid.uuid4()
        return super().create(validated_data)

class InvitacionActivaSerializer(serializers.ModelSerializer):
    invitado = InvitadoSerializer(read_only=True)
    punto_acceso = PuntoAccesoSerializer(read_only=True)

    class Meta:
        model = models.Invitacion
        fields = [
            'id', 'invitado', 'punto_acceso', 'fecha_creacion',
            'fecha_inicio', 'fecha_fin', 'dias_habilitados', 'tipo', 'token_qr',
        ]


class InvitacionHistoricoSerializer(serializers.ModelSerializer):
    invitado = InvitadoSerializer(read_only=True)
    punto_acceso = PuntoAccesoSerializer(read_only=True)

    class Meta:
        model = models.InvitacionHistorico
        fields = [
            'id', 'invitado', 'punto_acceso', 'fecha_creacion',
            'fecha_inicio', 'fecha_visita', 'fecha_fin',
            'dias_habilitados', 'estado', 'tipo', 'token_qr',
        ]


class InvitacionValidateSerializer(serializers.Serializer):
    token_qr = serializers.UUIDField()