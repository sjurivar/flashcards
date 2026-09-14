import { openHelpDialog } from '../components/dialog';
import { renderAiHelpBody } from '../content/ai';

export function openAiHelp(): void {
  openHelpDialog({
    title: 'Om AI-innhold',
    body: renderAiHelpBody(),
  });
}
