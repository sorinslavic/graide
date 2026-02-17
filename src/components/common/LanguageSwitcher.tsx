/**
 * Language Switcher Component
 * Allows users to switch between English and Romanian
 */

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  onDark?: boolean;
}

export default function LanguageSwitcher({ onDark = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation('common');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'ro' ? 'RO' : 'EN';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${onDark ? 'text-white/80 hover:text-white hover:bg-white/10' : ''}`}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{getCurrentLanguageLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'bg-gray-100' : ''}
        >
          {t('language.english')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('ro')}
          className={i18n.language === 'ro' ? 'bg-gray-100' : ''}
        >
          {t('language.romanian')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
