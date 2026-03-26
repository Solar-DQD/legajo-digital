'use client'

import { Button } from "@mui/material";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className='flex flex-col flex-1 items-center justify-center gap-4 px-4 text-center'>
      <p className='text-lg font-bold text-gray-800'>Algo salió mal</p>
      <p className='text-sm text-gray-500'>Ocurrió un error inesperado. Por favor intentá de nuevo.</p>
      <Button variant='contained' color='warning' disableElevation onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
