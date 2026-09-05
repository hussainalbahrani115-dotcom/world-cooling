import { useState } from 'react';
import { Appliance } from './types';
import { ApplianceSelector } from './components/ApplianceSelector';
import { SymptomSelector } from './components/SymptomSelector';
import { DiagnosisFlow } from './components/DiagnosisFlow';

type Step =
  | { name: 'appliance' }
  | { name: 'symptom'; appliance: Appliance }
  | { name: 'diagnosis'; appliance: Appliance; symptomId?: string };

function App() {
  const [step, setStep] = useState<Step>({ name: 'appliance' });

  return (
    <div className="app-shell">
      <header className="site-header">
        <h1>الفني الذكي</h1>
        <p className="site-tagline">تشخيص أعطال التبريد والتكييف والأفران خطوة بخطوة</p>
      </header>

      <main className="site-main">
        {step.name === 'appliance' && (
          <ApplianceSelector onSelect={(appliance) => setStep({ name: 'symptom', appliance })} />
        )}
        {step.name === 'symptom' && (
          <SymptomSelector
            appliance={step.appliance}
            onSelect={(symptomId) => setStep({ name: 'diagnosis', appliance: step.appliance, symptomId })}
            onBack={() => setStep({ name: 'appliance' })}
          />
        )}
        {step.name === 'diagnosis' && (
          <DiagnosisFlow
            appliance={step.appliance}
            symptomId={step.symptomId}
            onBack={() => setStep({ name: 'appliance' })}
          />
        )}
      </main>
    </div>
  );
}

export default App;
