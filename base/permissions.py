from rest_framework.permissions import BasePermission

from . import AccountRole


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account.role == AccountRole.admin


class IsGuardiaRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account.role == AccountRole.guardia


class IsSocioRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account.role == AccountRole.socio


class ClavePendiente(BasePermission):
    message = 'Debe cambiar la contraseña.'

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return True
        account = getattr(user, 'account', None)
        if account is None:
            return True
        return not account.debe_cambiar_clave
