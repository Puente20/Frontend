from rest_framework import serializers

from .models import BotonPanico, AlertaState
from administracion.serializers import LoteSimpleSerializer, SocioSimpleSerializer
from administracion.models import Lote, Socio

class AlertaValidation(serializers.ModelSerializer):
    estado = serializers.ChoiceField(choices=AlertaState.CHOICES)
    razon = serializers.CharField()
    lote = serializers.PrimaryKeyRelatedField(queryset=Lote.objects.all())
    socio = serializers.PrimaryKeyRelatedField(queryset=Socio.objects.all())

    class Meta:
        model = BotonPanico
        fields = ['estado', 'razon', 'lote', 'socio']

    def create(self, validated_data):
        socio = validated_data.pop('socio')
        BotonPanico.objects.create(
            created_by = socio,
            **validated_data
        )

class AlertaSerializer(serializers.ModelSerializer):
    estado = serializers.ChoiceField(choices=AlertaState.CHOICES)
    razon = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    lote = serializers.SerializerMethodField()
    socio = serializers.SerializerMethodField()

    class Meta:
        model = BotonPanico
        fields = ['id', 'estado', 'razon', 'created_at', 'lote', 'socio']

    def get_lote(self, obj):
        return LoteSimpleSerializer(obj.lote).data

    def get_socio(self, obj):
        return SocioSimpleSerializer(obj.created_by).data