import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const Stats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:4400/api/v1/departments/university-statistics"
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.statistics
        ) {
          setStats(response.data.data.statistics);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
        // Fallback to static data if API fails
        setStats([
          { number: "2,500+", label: "Students Enrolled" },
          { number: "85%", label: "Employment Rate" },
          { number: "50+", label: "Faculty Members" },
          { number: "30+", label: "Research Papers" },
        ]);
        setError("Could not load live statistics. Showing estimated values.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className='bg-[#1D3D6F] text-white py-12'>
        <div className='flex justify-center items-center'>
          <FaSpinner className='animate-spin text-3xl text-[#F7B500]' />
        </div>
      </section>
    );
  }

  return (
    <section className='bg-[#1D3D6F] text-white py-12'>
      <div className='flex flex-wrap justify-center gap-10 text-center'>
        {stats.map((stat, index) => (
          <div key={index} className='text-lg font-semibold'>
            <h3 className='text-3xl font-bold text-[#F7B500]'>{stat.number}</h3>
            <p className='text-[#E8ECEF]'>{stat.label}</p>
          </div>
        ))}
      </div>
      {error && (
        <div className='text-[#F7B500] text-center text-sm mt-4'>
          <p>{error}</p>
        </div>
      )}
    </section>
  );
};

export default Stats;
