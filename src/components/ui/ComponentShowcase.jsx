/**
 * Component Showcase
 * Demo page showing all UI components
 * Access at /showcase route (for development)
 */
import React, { useState } from 'react';
import {
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Input, Textarea,
  Modal,
  Badge, DotBadge,
  LoadingSkeleton, CardSkeleton,
  EmptyState, NoDataEmptyState,
} from './index';

const ComponentShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            UI Component Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modern, beautiful, reusable components
          </p>
        </div>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" icon={<span>🚀</span>}>With Icon</Button>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card gradient="blue">
              <CardHeader>
                <CardTitle>Blue Gradient</CardTitle>
                <CardDescription>Beautiful gradient card</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  This is a card with a blue gradient background.
                </p>
              </CardContent>
            </Card>

            <Card gradient="purple">
              <CardHeader>
                <CardTitle>Purple Gradient</CardTitle>
                <CardDescription>Eye-catching design</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  This is a card with a purple gradient background.
                </p>
              </CardContent>
            </Card>

            <Card gradient="green" onClick={() => alert('Card clicked!')}>
              <CardHeader>
                <CardTitle>Clickable Card</CardTitle>
                <CardDescription>With hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Click me to see the interaction!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Input label="Password" type="password" placeholder="Enter password" required />
            <Input 
              label="With Icon" 
              placeholder="Search..." 
              icon={<span>🔍</span>}
            />
            <Input 
              label="Error State" 
              placeholder="Invalid input" 
              error="This field is required"
            />
            <div className="md:col-span-2">
              <Textarea label="Description" placeholder="Enter description..." rows={3} />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="purple">Purple</Badge>
            <Badge variant="primary" gradient>Gradient</Badge>
            <Badge variant="success" icon={<DotBadge variant="success" />}>
              With Dot
            </Badge>
          </div>
        </section>

        {/* Loading Skeletons */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Loading Skeletons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Text</h3>
              <LoadingSkeleton variant="text" count={3} className="mb-2" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Card</h3>
              <CardSkeleton />
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Empty States</h2>
          <Card>
            <NoDataEmptyState 
              onAction={() => alert('Action clicked!')}
              actionLabel="Get Started"
            />
          </Card>
        </section>

        {/* Modal */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            }
          >
            <p className="text-gray-600 dark:text-gray-400">
              This is a beautiful modal with smooth animations. It can be closed by clicking
              the overlay, pressing Escape, or clicking the close button.
            </p>
          </Modal>
        </section>
      </div>
    </div>
  );
};

export default ComponentShowcase;
