import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Workflow from '../components/Workflow';
import ConverterGrid from '../components/ConverterGrid';
import DashboardPreview from '../components/DashboardPreview';

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <Workflow />
      <ConverterGrid />
      <DashboardPreview />
    </>
  );
};

export default Home;