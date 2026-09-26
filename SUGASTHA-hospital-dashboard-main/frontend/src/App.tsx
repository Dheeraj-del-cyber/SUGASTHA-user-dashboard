import { HealthcareProvider, useHealthcare } from './context/HealthcareContext';
import { GovHeader } from './components/common/GovHeader';
import { GovFooter } from './components/common/GovFooter';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { HospitalLogin } from './components/auth/HospitalLogin';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useHealthcare();

  if (!isAuthenticated) {
    return <HospitalLogin />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <GovHeader />
      <main className="flex-1 w-full bg-slate-50/50">
        <HospitalDashboard />
      </main>
      <GovFooter />
    </div>
  );
};

function App() {
  return (
    <HealthcareProvider>
      <AppContent />
    </HealthcareProvider>
  );
}

export default App;
