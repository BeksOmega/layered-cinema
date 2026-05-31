import { useState } from 'react';

import { Switch } from '@/components/ui/switch';

export default function CinemaModeToggle() {
  const [cinemaOn, setCinemaOn] = useState(
    document.documentElement.dataset.layeredCinema === 'on',
  );

  function handleToggle(checked: boolean) {
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
