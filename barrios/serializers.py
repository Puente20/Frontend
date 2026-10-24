from rest_framework import serializers

from . import models


class BarrioSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Barrio
        fields = ['id', 'nombre']
