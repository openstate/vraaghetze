import { redirect } from '@sveltejs/kit';

// Early links sent out were followed by a . ('dot') - this ensures that the user ends up at /mijn-vragen
export function load() {
  redirect(301, '/mijn-vragen');
}