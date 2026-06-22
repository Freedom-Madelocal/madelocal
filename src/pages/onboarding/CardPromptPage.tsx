import { useNavigate, useSearchParams } from "react-router-dom";
import CardPrompt from "@/components/onboarding/CardPrompt";

export default function CardPromptPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const after = params.get('after'); // 'skip-seller' or null
  const title = after === 'skip-seller'
    ? "Save a card for purchases?"
    : "One last thing — save a card?";
  const description = "Set it up now to check out faster later, or just look around for now.";

  return (
    <CardPrompt
      onSaveCard={() => navigate('/onboarding/card?mode=buyer')}
      onSkip={() => navigate('/discover', { replace: true })}
      title={title}
      description={description}
    />
  );
}
