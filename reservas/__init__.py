class ReservaState:
    pendiente = 'pendiente'
    aprobado = 'aprobado'
    vencido = 'vencido'
    recepcionado = 'recepcionado'

    CHOICES = [
        (pendiente, 'Pendiente'),
        (aprobado, 'Aprobado'),
        (vencido, 'Vencido'),
        (recepcionado, 'Recepcionado'),
    ]

class ReservaHistoricoState:
    ok = 'ok'
    advertencia = 'advertencia'
    rechazado = 'rechazado'
    no_recepcionado = 'no_recepcionado'

    CHOICES = [
        (ok, 'Ok'),
        (advertencia, 'Advertencia'),
        (rechazado, 'Rechazada'),
        (no_recepcionado, 'Reserva no recepcionada'),
    ]