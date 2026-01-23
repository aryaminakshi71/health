"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface FooterProps {
  appName?: string;
  companyName?: string;
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
}

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  email?: string;
}

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export function Footer({ 
  appName = "ERP Application",
  companyName = "ERPSurveiVoip",
  socialLinks = {},
  contactInfo = {}
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL as string) || 'http://127.0.0.1:8000';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{appName}</h3>
            <p className="text-gray-300 mb-4">
              Advanced ERP system with comprehensive business tools, patient management, 
              and video conferencing capabilities.
            </p>
            <div className="flex space-x-4">
              {socialLinks.github && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socialLinks.twitter && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socialLinks.linkedin && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {socialLinks.email && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`mailto:${socialLinks.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  API Reference
                </a>
              </li>
              <li>
                <a href={`${backendUrl}/api/v1/camera/capabilities`} target="_blank" className="text-gray-300 hover:text-white text-sm">
                  Surveillance Capabilities
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              {contactInfo.email && (
                <div className="flex items-center text-sm text-gray-300">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-white">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center text-sm text-gray-300">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${contactInfo.phone}`} className="hover:text-white">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              {contactInfo.address && (
                <div className="flex items-start text-sm text-gray-300">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                  <span>{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">
              © {currentYear} {companyName}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-300 hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
