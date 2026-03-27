import { useFormContext, useWatch } from "react-hook-form";
import { LegajoFormData } from "@/lib/types/legajo";
import { useQuery } from "@tanstack/react-query";
import { getHerramientas } from "@/actions/herramienta/herramienta.actions";
import { useSnackbar } from "@/lib/context/snackbar";
import { useEffect, useState } from "react";
import StepWrapper from "@/components/common/StepWrapper";
import { Chip, InputAdornment, Skeleton, TextField } from "@mui/material";

export default function Step3({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  //hooks
  const { showWarning } = useSnackbar();
  const form = useFormContext<LegajoFormData>();
  const herramientas = useWatch({ control: form.control, name: 'herramientas' });
  const herramientasPersonalizadas = useWatch({ control: form.control, name: 'herramientasPersonalizadas' });
  const [inputHerramienta, setInputHerramienta] = useState('');
  //query
  const herramientasQuery = useQuery({
    queryKey: ['getHerramientas'],
    queryFn: () => getHerramientas(),
    refetchOnWindowFocus: false,
  });
  //feedback
  useEffect(() => {
    if (herramientasQuery.isError) showWarning('Error cargando herramientas');
  }, [showWarning, herramientasQuery.isError]);
  //helpers
  function toggleHerramienta(id: number) {
    if (herramientas.includes(id)) {
      form.setValue('herramientas', herramientas.filter(h => h !== id));
    } else {
      form.setValue('herramientas', [...herramientas, id]);
    };
  };
  function addPersonalizada() {
    const nombre = inputHerramienta.trim();
    if (!nombre || herramientasPersonalizadas.some(h => h.toLowerCase() === nombre.toLowerCase())) return;
    form.setValue('herramientasPersonalizadas', [...herramientasPersonalizadas, nombre]);
    setInputHerramienta('');
  };
  function removePersonalizada(nombre: string) {
    form.setValue('herramientasPersonalizadas', herramientasPersonalizadas.filter(h => h !== nombre));
  };
  const seleccionadas = herramientasQuery.data?.filter(h => herramientas.includes(h.id)) ?? [];
  return (
    <StepWrapper onNext={onNext} onBack={onBack} title='Herramientas y Software' subtitle='Programas y equipos que manejás' isValid={seleccionadas.length > 0 || herramientasPersonalizadas.length > 0}>
      {/* seleccionadas */}
      {(seleccionadas.length > 0 || herramientasPersonalizadas.length > 0) && (
        <div className='flex flex-wrap gap-2'>
          {seleccionadas.map(h => (
            <Chip key={h.id} label={h.nombre} color='warning' size='small' onDelete={() => toggleHerramienta(h.id)} />
          ))}
          {herramientasPersonalizadas.map(nombre => (
            <Chip key={nombre} label={nombre} color='warning' size='small' onDelete={() => removePersonalizada(nombre)} />
          ))}
        </div>
      )}
      {/* agregar personalizada */}
      <TextField
        value={inputHerramienta}
        onChange={e => setInputHerramienta(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPersonalizada(); } }}
        label='Escribí una herramienta personalizada...'
        variant='outlined'
        color='warning'
        size='small'
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Chip label='+ Agregar' color='warning' size='small' onClick={addPersonalizada} disabled={!inputHerramienta.trim()} />
              </InputAdornment>
            )
          }
        }}
      />
      {/* herramientas predefinidas */}
      <div className='flex flex-wrap gap-2'>
        {herramientasQuery.isLoading
          ? Array.from({ length: 50 }).map((_, i) => <Skeleton key={i} variant='rectangular' className='!rounded-2xl' width={Math.max(80, Math.random() * 150)} height={24} />)
          : herramientasQuery.data?.map(h => (
            <Chip
              key={h.id}
              label={h.nombre}
              size='small'
              variant={herramientas.includes(h.id) ? 'filled' : 'outlined'}
              color={herramientas.includes(h.id) ? 'warning' : 'default'}
              onClick={() => toggleHerramienta(h.id)}
              className={`${herramientas.includes(h.id) ? '' : '!text-gray-600'}`}
            />
          ))
        }
      </div>
    </StepWrapper>
  );
}
