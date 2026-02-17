# accounts/utils.py
def get_user_role(user):
    user_roles = user.roles.values_list('role_name', flat=True)
    
    if 'Doctor' in user_roles:
        return 'Doctor'
    elif 'Patient' in user_roles:
        return 'Patient'
    return None

def is_doctor(user):
    return user.roles.filter(role_name='Doctor').exists()

def is_patient(user):
    return user.roles.filter(role_name='Patient').exists()

def has_role(user, role_name):
    return user.roles.filter(role_name=role_name).exists()