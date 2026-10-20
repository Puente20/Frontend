class LoteEstado:
    libre = 'libre'
    ocupado = 'ocupado'
    construccion = 'construccion'

    CHOICES = [
        (libre, 'Libre'),
        (ocupado, 'Ocupado'),
        (construccion, 'En construccion'),
    ]

class PuntoAccesoTipo:
    peatonal = 'peatonal'
    vehicular = 'vehicular'
    mixto = 'mixto'

    CHOICES = [
        (peatonal, 'Peatonal'),
        (vehicular, 'Vehicular'),
        (mixto, 'Mixto'),
    ]

class PuntoAccesoEstado:
    abierto = 'abierto'
    cerrado = 'cerrado'
    construccion = 'construccion'

    CHOICES = [
        (abierto, 'Abierto'),
        (cerrado, 'Cerrado'),
        (construccion, 'En construccion'),
    ]