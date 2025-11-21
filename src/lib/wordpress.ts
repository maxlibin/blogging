"use server";

import { WordPressSettings } from '../types';

export const validateWPConnection = async (
  settings: WordPressSettings
): Promise<boolean> => {
  try {
    const apiUrl = `${settings.siteUrl}/wp-json/wp/v2/users/me`;
    const credentials = btoa(`${settings.username}:${settings.appPassword}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('WordPress validation error:', error);
    return false;
  }
};

export const draftToWordPress = async (
  settings: WordPressSettings,
  title: string,
  content: string
): Promise<{ id: number; link: string }> => {
  if (!settings.isConnected) {
    throw new Error('WordPress is not connected');
  }

  try {
    const apiUrl = `${settings.siteUrl}/wp-json/wp/v2/posts`;
    const credentials = btoa(`${settings.username}:${settings.appPassword}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        status: 'draft',
      }),
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.statusText}`);
    }

    const post = await response.json();
    return {
      id: post.id,
      link: post.link,
    };
  } catch (error) {
    console.error('WordPress draft error:', error);
    throw new Error('Failed to create WordPress draft');
  }
};

