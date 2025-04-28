import React from 'react';
import { Link, Href } from 'expo-router';
import IconButton from './IconButton';

interface NavigationItemProps {
  path: Href;
  icon: string;
  isActive: boolean;
  style?: any;
}

function NavigationItem({ path, icon, isActive, style }: NavigationItemProps) {
  return (
    <Link href={path} asChild>
      <IconButton
        name={icon}
        isActive={isActive}
        style={style}
      />
    </Link>
  );
}

export default NavigationItem;
