import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { coordinatorApi } from '../../api'

const Statistics = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await coordinatorApi.getPlacementStats()
      setStats(data)
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>
        📊 {stats?.department} Department Statistics
      </h2>

      <div className='stats-container'>
        <div style={{
          background: 'linear-gradient(135deg, #3498db, #2980b9)',
          color: 'white', padding: '20px', borderRadius: '12px',
          flex: 1, textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '32px' }}>
            {stats?.totalStudents || 0}
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Students</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
          color: 'white', padding: '20px', borderRadius: '12px',
          flex: 1, textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '32px' }}>
            {stats?.totalPlaced || 0}
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Students Placed</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
          color: 'white', padding: '20px', borderRadius: '12px',
          flex: 1, textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '32px' }}>
            {stats?.overallPlacementPercentage || 0}%
          </h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Placement Rate</p>
        </div>
      </div>

      <div className='stats-container'>
        <div style={{
          background: 'white', border: '2px solid #f39c12',
          padding: '20px', borderRadius: '12px',
          flex: 1, textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#f39c12', fontSize: '28px' }}>
            ₹{stats?.averagePackage || 0} LPA
          </h2>
          <p style={{ margin: 0, color: '#7f8c8d' }}>Average Package</p>
        </div>

        <div style={{
          background: 'white', border: '2px solid #e74c3c',
          padding: '20px', borderRadius: '12px',
          flex: 1, textAlign: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#e74c3c', fontSize: '28px' }}>
            ₹{stats?.highestPackage || 0} LPA
          </h2>
          <p style={{ margin: 0, color: '#7f8c8d' }}>Highest Package</p>
        </div>
      </div>

      <div className='section'>
        <h3>🏆 Top Recruiting Companies</h3>
        {stats?.topCompanies && stats.topCompanies.length > 0 ? (
          stats.topCompanies.map((company, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px',
                background: index === 0 ? '#fff3cd' : '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '10px'
              }}
            >
              <span style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: index === 0 ? '#f39c12' : '#7f8c8d',
                minWidth: '30px'
              }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' :
                  index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {company.name}
                </p>
              </div>
              <span style={{
                background: '#3498db',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                {company.count} students
              </span>
            </div>
          ))
        ) : (
          <p style={{ color: '#7f8c8d' }}>No placements recorded yet!</p>
        )}
      </div>

    </Layout>
  )
}

export default Statistics
