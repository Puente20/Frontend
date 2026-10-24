from abc import ABC, abstractmethod
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from base import Weekdays
from . import InvitacionTipo, InvitacionEstado, models
from reservas.models import Reserva, ReservaHistorico


class InvitacionValidationStrategy(ABC):
    def validar(self, invitacion, ahora):
        self._validar_vigencia(invitacion, ahora)
        self._validar_tipo(invitacion, ahora)

    def _validar_vigencia(self, invitacion, ahora):
        if ahora < invitacion.fecha_inicio:
            raise ValidationError({'token_qr': 'La invitación todavía no está vigente.'})
        if invitacion.fecha_fin and ahora > invitacion.fecha_fin:
            raise ValidationError({'token_qr': 'La invitación está vencida.'})

    @abstractmethod
    def _validar_tipo(self, invitacion, ahora):
        pass


class UnicaValidationStrategy(InvitacionValidationStrategy):
    def _validar_tipo(self, invitacion, ahora):
        return


class RecurrenteValidationStrategy(InvitacionValidationStrategy):
    def _validar_tipo(self, invitacion, ahora):
        if not self._dia_habilitado(invitacion, ahora):
            raise ValidationError({'token_qr': 'La invitación no está habilitada para hoy.'})

    def _dia_habilitado(self, invitacion, ahora):
        dias = invitacion.dias_habilitados or []
        if not dias:
            return True

        hoy = ahora.weekday()
        habilitados = set()
        for dia in dias:
            if isinstance(dia, int):
                habilitados.add(dia)
            elif isinstance(dia, str):
                codigo = Weekdays.CODES.get(dia.strip().lower())
                if codigo is not None:
                    habilitados.add(codigo)
        return hoy in habilitados


class InvitacionStrategyFactory:
    _strategies = {
        InvitacionTipo.unica: UnicaValidationStrategy(),
        InvitacionTipo.recurrente: RecurrenteValidationStrategy(),
    }

    @classmethod
    def para(cls, tipo):
        strategy = cls._strategies.get(tipo)
        if strategy is None:
            raise ValidationError({'token_qr': 'El tipo de invitación no se puede validar.'})
        return strategy


class InvitacionService:
    @staticmethod
    def _archivar(invitacion, estado, cuando):
        return models.InvitacionHistorico.objects.create(
            invitado=invitacion.invitado,
            socio=invitacion.socio,
            punto_acceso=invitacion.punto_acceso,
            fecha_creacion=invitacion.fecha_creacion,
            fecha_inicio=invitacion.fecha_inicio,
            fecha_visita=cuando,
            fecha_fin=invitacion.fecha_fin,
            dias_habilitados=invitacion.dias_habilitados or [],
            estado=estado,
            tipo=invitacion.tipo,
            token_qr=invitacion.token_qr,
        )

    @staticmethod
    @transaction.atomic
    def recepcionar(token_qr):
        invitacion = (
            models.Invitacion.objects
            .select_for_update()
            .filter(token_qr=token_qr)
            .select_related('invitado', 'socio', 'punto_acceso')
            .first()
        )
        if invitacion is None:
            raise ValidationError({'token_qr': 'No hay una invitación activa con ese código.'})

        ahora = timezone.now()
        InvitacionStrategyFactory.para(invitacion.tipo).validar(invitacion, ahora)
        historico = InvitacionService._archivar(invitacion, InvitacionEstado.recepcionado, ahora)
        invitacion.delete()
        return historico

    @staticmethod
    @transaction.atomic
    def dar_de_baja(invitacion_id):
        invitacion = (
            models.Invitacion.objects
            .select_for_update()
            .filter(pk=invitacion_id)
            .select_related('invitado', 'socio', 'punto_acceso')
            .first()
        )
        if invitacion is None:
            raise ValidationError({'detail': 'La invitación ya no está activa.'})

        historico = InvitacionService._archivar(
            invitacion,
            InvitacionEstado.vencida,
            timezone.now(),
        )
        invitacion.delete()
        return historico


def historial_de(socio):
    return {
        'invitaciones_activas': (
            models.Invitacion.objects
            .filter(socio=socio)
            .select_related('invitado', 'punto_acceso')
            .order_by('-fecha_creacion')
        ),
        'invitaciones_recepcionadas': (
            models.InvitacionHistorico.objects
            .filter(socio=socio, estado=InvitacionEstado.recepcionado)
            .select_related('invitado', 'punto_acceso')
            .order_by('-fecha_visita')
        ),
        'reservas_activas': (
            Reserva.objects.filter(socio=socio).select_related('lugar').order_by('-fecha_desde')
        ),
        'reservas_completadas': (
            ReservaHistorico.objects.filter(socio=socio).select_related('lugar').order_by('-fecha_desde')
        ),
    }
