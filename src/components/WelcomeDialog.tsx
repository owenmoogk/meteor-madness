import { useState } from 'react';
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
  const { loadPreset } = useSimStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<'small' | 'medium' | 'large' | 'tunguska' | 'chicxulub'>('medium');

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
                onValueChange={(v) => setSelectedPreset(v as typeof selectedPreset)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="tunguska">Tunguska</SelectItem>
                  <SelectItem value="chicxulub">Chicxulub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                onClick={() => {
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


