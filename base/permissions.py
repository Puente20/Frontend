from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    BasePermission,
)
from . import AccountRole

class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account_user.role == AccountRole.admin

class IsGuardiaRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account_user.role == AccountRole.guardia

class IsSocioRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account_user.role == AccountRole.socio