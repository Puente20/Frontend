class AccountRole:
    admin = 'admin'
    socio = 'socio'
    guardia = 'guardia'

    ROLES = [
        (admin, 'admin'),
        (socio, 'socio'),
        (guardia, 'guardia'),
    ]

class Weekdays:

    CODES = {
        'lunes': 0,
        'martes': 1,
        'miercoles': 2,
        'jueves': 3,
        'viernes': 4,
        'sabado': 5,
        'domingo': 6,
    }