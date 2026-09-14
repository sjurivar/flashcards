import { openHelpDialog } from '@features/help';
import { renderRatingHelpBody } from '../content/ratingHelp';

export function openRatingHelp(): void {
  openHelpDialog({
    title: 'Hva betyr vurderingene?',
    body: renderRatingHelpBody(),
  });
}
