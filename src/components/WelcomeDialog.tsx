import { useEffect, useMemo, useState } from 'react';
import { useSimStore } from '@/state/useSimStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function WelcomeDialog() {
  const { presets, presetsLoading, presetsError, fetchPresets, loadPreset } = useSimStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const presetKeys = useMemo(() => Object.keys(presets ?? {}), [presets]);

  useEffect(() => {
    if (!selectedPreset && presetKeys.length > 0) {
      setSelectedPreset(presetKeys.includes('medium') ? 'medium' : presetKeys[0]);
    }
  }, [presetKeys, selectedPreset]);

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Welcome to Asteroid Impact Simulator</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          <div className="sm:col-span-1 flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-24 h-24 rounded" />
          </div>
          <div className="sm:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Select Preset Astriod</h3>
            </div>
            <div className="max-w-sm">
              <Select
                value={selectedPreset}
                onValueChange={(v) => setSelectedPreset(v)}
                disabled={presetsLoading || !!presetsError || presetKeys.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={presetsLoading ? 'Loading presets…' : presetsError ? 'Failed to load presets' : 'Choose a preset'} />
                </SelectTrigger>
                <SelectContent>
                  {presetKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                disabled={!selectedPreset || !!presetsError || presetsLoading}
                onClick={() => {
                  if (!selectedPreset) return;
                  loadPreset(selectedPreset);
                  setShowWelcome(false);
                }}
              >
                Simulate
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


