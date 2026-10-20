class InvitacionTipo:
    unica = 'unica'
    recurrente = 'recurrente'

    CHOICES = [
        (unica, 'Unica'),
        (recurrente, 'Recurrente'),
    ]

class InvitacionEstado:
    vencida = 'vencida'
    recepcionado = 'recepcionado'

    CHOICES = [
        (vencida, 'Vencida'),
        (recepcionado, 'Recepcionado'),
    ]