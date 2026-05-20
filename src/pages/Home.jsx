import React from 'react';
import Hero from '../components/Hero';
import ConverterGrid from '../components/ConverterGrid';
import Features from '../components/Features';
import Workflow from '../components/Workflow';
import DashboardPreview from '../components/DashboardPreview';

const Home = () => {
  return (
    <>
      <Hero />
      <DashboardPreview />
      <ConverterGrid />
      <Features />
      <Workflow />
    </>
  );
};

export default Home;
