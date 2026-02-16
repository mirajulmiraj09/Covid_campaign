from django.core.management.base import BaseCommand
from accounts.models import Role

class Command(BaseCommand):
    help = "Create default roles (Patient and Doctor) if they do not exist"

    def handle(self, *args, **kwargs):
        patient_role, created = Role.objects.get_or_create(
            role_name=Role.PATIENT,
            defaults={'permissions': {'view_profile': True, 'edit_profile': True}}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Patient role'))
        else:
            self.stdout.write('Patient role already exists')
        
        doctor_role, created = Role.objects.get_or_create(
            role_name='Doctor',
            defaults={'permissions': {'view_profile': True, 'edit_profile': True, 'manage_patients': True}}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Doctor role'))
        else:
            self.stdout.write('Doctor role already exists')
        
        self.stdout.write(self.style.SUCCESS('Roles setup complete!'))