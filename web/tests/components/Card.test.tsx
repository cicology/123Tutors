/**
 * TestSprite Unit Tests - Card Component
 * Tests the Card component functionality
 */

import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
  test('renders card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card with header', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card with footer', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
        <CardFooter>Card footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Card footer')).toBeInTheDocument();
  });

  test('applies custom className to card', () => {
    render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Content').closest('.custom-card');
    expect(card).toBeInTheDocument();
  });

  test('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Details about the student</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Student name: John Doe</p>
          <p>Student ID: STU001</p>
        </CardContent>
        <CardFooter>
          <button>Edit Student</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Student Information')).toBeInTheDocument();
    expect(screen.getByText('Details about the student')).toBeInTheDocument();
    expect(screen.getByText('Student name: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Student ID: STU001')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit student/i })).toBeInTheDocument();
  });
});
