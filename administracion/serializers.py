from rest_framework import serializers
from .models import Lote, PuntoAcceso, Socio, Administrador, Guardia, Proveedor, Account

class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = ['id', 'numero', 'estado']

class PuntoAccesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PuntoAcceso
        fields = ['id', 'nombre', 'tipo', 'estado']

class SocioSerializer(serializers.ModelSerializer):
    lote_numero = serializers.IntegerField(write_only=True, required=False)
    lote = serializers.SerializerMethodField(read_only=True)
    nombre_completo = serializers.SerializerMethodField(read_only=True)
    rolPropiedad = serializers.CharField(source='rol_propiedad', required=False)
    fechaInicioContrato = serializers.DateField(source='fecha_inicio_contrato', required=False, allow_null=True)
    fechaFinContrato = serializers.DateField(source='fecha_fin_contrato', required=False, allow_null=True)

    class Meta:
        model = Socio
        fields = [
            'id',
            'nombre',
            'apellido',
            'nombre_completo',
            'dni',
            'email',
            'telefono',
            'tipo',
            'lote',
            'lote_numero',
            'rolPropiedad',
            'patentes',
            'fechaInicioContrato',
            'fechaFinContrato',
            'is_active',
        ]

    def get_lote(self, obj):
        return obj.lote.numero if obj.lote else 1

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()

    def create(self, validated_data):
        lote_num = validated_data.pop('lote_numero', None)
        if lote_num is None and 'lote' in self.initial_data:
            raw_lote = str(self.initial_data.get('lote', '')).replace('Lote', '').strip()
            if raw_lote.isdigit():
                lote_num = int(raw_lote)
        if lote_num:
            lote_obj, _ = Lote.objects.get_or_create(numero=lote_num, defaults={'estado': 'ocupado'})
            validated_data['lote'] = lote_obj
        return super().create(validated_data)

    def update(self, instance, validated_data):
        lote_num = validated_data.pop('lote_numero', None)
        if lote_num is None and 'lote' in self.initial_data:
            raw_lote = str(self.initial_data.get('lote', '')).replace('Lote', '').strip()
            if raw_lote.isdigit():
                lote_num = int(raw_lote)
        if lote_num:
            lote_obj, _ = Lote.objects.get_or_create(numero=lote_num, defaults={'estado': 'ocupado'})
            validated_data['lote'] = lote_obj
        return super().update(instance, validated_data)
