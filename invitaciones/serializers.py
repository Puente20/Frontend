from rest_framework import serializers

from . import models, InvitacionEstado, InvitacionTipo

class InvitadoSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    def get_nombre_completo(self, obj):
        return obj.apellido_nombre()

    class Meta:
        model = models.Invitado
        fields = ['nombre', 'apellido', 'dni', 'nombre_completo']


class InvitacionViewSerializer(serializers.ModelSerializer):
    invitado = InvitadoSerializer(read_only=True)
    socio = InvitadoSerializer(read_only=True)
    punto_acceso = InvitadoSerializer(read_only=True)
    tipo = serializers.ChoiceField(choices=InvitacionTipo.CHOICES)

    class Meta:
        model = models.Invitacion
        fields = ['id', 'invitado', 'socio', 'punto_acceso', 'fecha_creacion', 'fecha_inicio', 'fecha_visita', 'dias_habilitados', 'tipo', 'token_qr']

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

    class Meta:
        model = models.Invitacion
        fields = ['invitado', 'socio', 'punto_acceso', 'fecha_inicio', 'fecha_visita', 'dias_habilitados', 'tipo']