import { useFormContext, useWatch } from "react-hook-form";
import { LegajoFormData } from "@/app/page";
import { useQuery } from "@tanstack/react-query";
import { getHabilidadesByConvenio } from "@/actions/habilidad/habilidad.actions";
import { useSnackbar } from "@/lib/context/snackbar";
import { useEffect, useState } from "react";
import StepWrapper from "../StepWrapper";
import { Chip, InputAdornment, Skeleton, TextField } from "@mui/material";

export default function Step2({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  //hooks
  const { showWarning } = useSnackbar();
  const form = useFormContext<LegajoFormData>();
  const habilidades = useWatch({ control: form.control, name: 'habilidades' });
  const habilidadesPersonalizadas = useWatch({ control: form.control, name: 'habilidadesPersonalizadas' });
  const [inputHabilidad, setInputHabilidad] = useState('');
  //query
  const habilidadesQuery = useQuery({
    queryKey: ['getHabilidades', form.watch('convenio')],
    queryFn: () => getHabilidadesByConvenio({ idTipoConvenio: Number(form.watch('convenio')) }),
    enabled: form.watch('convenio') !== '',
    refetchOnWindowFocus: false,
  });
  //feedback
  useEffect(() => {
    if (habilidadesQuery.isError) showWarning('Error cargando habilidades');
  }, [showWarning, habilidadesQuery.isError]);
  //helpers
  function toggleHabilidad(id: number) {
    if (habilidades.includes(id)) {
      form.setValue('habilidades', habilidades.filter(h => h !== id));
    } else {
      form.setValue('habilidades', [...habilidades, id]);
    };
  };
  function addPersonalizada() {
    const nombre = inputHabilidad.trim();
    if (!nombre || habilidadesPersonalizadas.some(h => h.toLowerCase() === nombre.toLowerCase())) return;
    form.setValue('habilidadesPersonalizadas', [...habilidadesPersonalizadas, nombre]);
    setInputHabilidad('');
  };
  function removePersonalizada(nombre: string) {
    form.setValue('habilidadesPersonalizadas', habilidadesPersonalizadas.filter(h => h !== nombre));
  };
  const seleccionadas = habilidadesQuery.data?.filter(h => habilidades.includes(h.id)) ?? [];
  return (
    <StepWrapper onNext={onNext} onBack={onBack} title='Habilidades' subtitle='Competencias profesionales' isValid={seleccionadas.length > 0 || habilidadesPersonalizadas.length > 0}>
      {/* seleccionadas */}
      {(seleccionadas.length > 0 || habilidadesPersonalizadas.length > 0) && (
        <div className='flex flex-wrap gap-2'>
          {seleccionadas.map(h => (
            <Chip key={h.id} label={h.nombre} color='warning' size='small' onDelete={() => toggleHabilidad(h.id)} />
          ))}
          {habilidadesPersonalizadas.map(nombre => (
            <Chip key={nombre} label={nombre} color='warning' size='small' onDelete={() => removePersonalizada(nombre)} />
          ))}
        </div>
      )}
      {/* agregar personalizada */}
      <TextField
        value={inputHabilidad}
        onChange={e => setInputHabilidad(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPersonalizada(); } }}
        label='Escribí una habilidad personalizada...'
        variant='outlined'
        color='warning'
        size='small'
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <Chip label='+ Agregar' color='warning' size='small' onClick={addPersonalizada} disabled={!inputHabilidad.trim()} />
              </InputAdornment>
            )
          }
        }}
      />
      {/* habilidades predefinidas */}
      <div className='flex flex-wrap gap-2'>
        {habilidadesQuery.isLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant='rectangular' className='!rounded-2xl' width={Math.max(80, Math.random() * 150)} height={24} />)
          : habilidadesQuery.data?.map(h => (
            <Chip
              key={h.id}
              label={h.nombre}
              size='small'
              variant={habilidades.includes(h.id) ? 'filled' : 'outlined'}
              color={habilidades.includes(h.id) ? 'warning' : 'default'}
              onClick={() => toggleHabilidad(h.id)}
              className={`${habilidades.includes(h.id) ? '' : '!text-gray-600'}`}
            />
          ))
        }
      </div>
    </StepWrapper>
  );
};
