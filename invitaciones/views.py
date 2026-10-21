from django.shortcuts import render, get_object_or_404
from rest_framework.viewsets import ModelViewSet

from base import permissions

from . import models
from . import serializers

class InvitacionViewSet(ModelViewSet):
    queryset = models.Invitacion.objects.all().select_related('')
    serializer_class = serializers.InvitacionSerializer
    permission_classes = [permissions.IsSocioRole]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return serializers.InvitacionViewSerializer
        return super().get_serializer_class()