import Swal from 'sweetalert2'

const confirmButtonColor = '#C56B86'

export async function showSuccess(message: string) {
  await Swal.fire({
    icon: 'success',
    title: 'Listo',
    text: message,
    confirmButtonColor,
  })
}

export async function showError(message: string) {
  await Swal.fire({
    icon: 'error',
    title: 'No se pudo completar',
    text: message,
    confirmButtonColor,
  })
}
