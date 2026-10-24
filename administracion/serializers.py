from rest_framework import serializers

from base.services import validar_dni_unico_api
from . import models
from .services import validar_contacto_proveedor


class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Este campo es requerido.',
            'blank': 'Este campo es requerido.',
        },
    )


class CorreoOpcionalField(serializers.EmailField):
    def run_validation(self, data=serializers.empty):
        if isinstance(data, str):
            data = data.strip()
        return super().run_validation(data)


class AccountSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = models.Account
        fields = ['id', 'role', 'username', 'password', 'email']
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        validated_data.pop('username', None)
        validated_data.pop('password', None)
        validated_data.pop('email', None)
        return super().update(instance, validated_data)


class PersonaSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        validar_dni_unico_api(
            attrs.get('dni', getattr(self.instance, 'dni', None)),
            self.instance,
        )
        return attrs


class SocioSerializer(PersonaSerializer):
    class Meta:
        model = models.Socio
        fields = ['id', 'nombre', 'apellido', 'dni', 'account', 'tipo', 'lote']
        read_only_fields = ['account']


class GuardiaSerializer(PersonaSerializer):
    class Meta:
        model = models.Guardia
        fields = ['id', 'nombre', 'apellido', 'dni', 'account']
        read_only_fields = ['account']


class AdministradorSerializer(PersonaSerializer):
    class Meta:
        model = models.Administrador
        fields = ['id', 'nombre', 'apellido', 'dni', 'account']


class ProveedorSerializer(PersonaSerializer):
    contacto_telefono = serializers.CharField(max_length=20, allow_blank=True, required=False)
    contacto_mail = CorreoOpcionalField(max_length=50, allow_blank=True, required=False)

    class Meta:
        model = models.Proveedor
        fields = ['id', 'nombre', 'apellido', 'dni', 'contacto_telefono', 'contacto_mail']

    def validate(self, attrs):
        attrs = super().validate(attrs)
        telefono = attrs.get(
            'contacto_telefono',
            getattr(self.instance, 'contacto_telefono', ''),
        )
        mail = attrs.get(
            'contacto_mail',
            getattr(self.instance, 'contacto_mail', ''),
        )
        telefono, mail = validar_contacto_proveedor(telefono, mail)
        attrs['contacto_telefono'] = telefono
        attrs['contacto_mail'] = mail
        return attrs


class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Lote
        fields = ['id', 'numero', 'estado']


class PuntoAccesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PuntoAcceso
        fields = ['id', 'nombre', 'tipo', 'estado']
