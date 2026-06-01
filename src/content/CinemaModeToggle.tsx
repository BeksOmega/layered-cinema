import { useState, useRef } from 'react';

import { Switch } from '@/components/ui/switch';

const STORAGE_KEY_PREFIX = 'layered-cinema:';

interface Props {
  videoId: string;
}

export default function CinemaModeToggle({ videoId }: Props) {
  const [cinemaOn, setCinemaOn] = useState(
    localStorage.getItem(STORAGE_KEY_PREFIX + videoId) === 'on',
  );
  const hadDarkBeforeCinema = useRef(false);

  function handleToggle(checked: boolean) {
    if (checked) {
      localStorage.setItem(STORAGE_KEY_PREFIX + videoId, 'on');
      hadDarkBeforeCinema.current = document.documentElement.hasAttribute('dark');
      document.documentElement.setAttribute('dark', '');
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + videoId);
      if (!hadDarkBeforeCinema.current) {
        document.documentElement.removeAttribute('dark');
      }
    }
    document.documentElement.dataset.layeredCinema = checked ? 'on' : 'off';
    setCinemaOn(checked);
  }

  return (
    <div className="flex items-center justify-between pb-4">
      <label
        htmlFor="cinema-mode-switch"
        className="text-[14px] font-medium cursor-pointer select-none"
      >
        Cinema Mode
      </label>
      <Switch
        id="cinema-mode-switch"
        checked={cinemaOn}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
