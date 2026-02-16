from rest_framework.permissions import BasePermission
from accounts.models import Role

class IsDoctorOrSuperuser(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_superuser:
            return True

        return user.roles.filter(
            role_name=Role.DOCTOR
        ).exists()
