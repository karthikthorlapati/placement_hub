import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'
import { formatDate } from '../../utils/helpers'

const statusConfig = {
  applied: {
    label: 'Applied',
    color: '#3498db',
    bg: '#eaf4ff',
    icon: '📋'
  },
  shortlisted: {
    label: 'Shortlisted',
    color: '#f39c12',
    bg: '#fef9e7',
    icon: '🟡'
  },
  selected: {
    label: 'Selected',
    color: '#2ecc71',
    bg: '#eafaf1',
    icon: '🎉'
  },
  rejected: {
    label: 'Rejected',
    color: '#e74c3c',
    bg: '#fdedec',
    icon: '❌'
  }
}

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await studentApi.getMyApplications()
      setApplications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getFiltered = () => {
    if (activeFilter === 'all') return applications
    return applications.filter(app => app.status === activeFilter)
  }

  const statusCount = (status) =>
    status === 'all'
      ? applications.length
      : applications.filter(a => a.status === status).length

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  const filtered = getFiltered()

  return (
    <Layout>
      <h2 className='page-title'>📋 My Applications</h2>

      {/* Summary Stats Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {['applied', 'shortlisted', 'selected', 'rejected'].map(status => {
          const cfg = statusConfig[status]
          const count = statusCount(status)
          return (
            <div
              key={status}
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.color}`,
                borderRadius: '10px',
                padding: '12px 18px',
                textAlign: 'center',
                minWidth: '100px',
                flex: 1
              }}
            >
              <p style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: cfg.color,
                margin: 0
              }}>
                {count}
              </p>
              <p style={{
                fontSize: '12px',
                color: cfg.color,
                margin: 0
              }}>
                {cfg.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map(
          status => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: activeFilter === status
                  ? '2px solid #3498db'
                  : '1px solid #ddd',
                background: activeFilter === status ? '#3498db' : 'white',
                color: activeFilter === status ? 'white' : '#555',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeFilter === status ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {' '}({statusCount(status)})
            </button>
          )
        )}
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <div className='empty-state'>
          <h3>
            {activeFilter === 'all'
              ? 'No Applications Yet!'
              : `No ${activeFilter} applications`}
          </h3>
          {activeFilter === 'all' && (
            <p>Go to Companies page and apply for your first job!</p>
          )}
        </div>
      ) : (
        filtered.map(app => {
          const config = statusConfig[app.status] || statusConfig.applied
          const isExpanded = expandedId === app._id

          return (
            <div
              key={app._id}
              className='company-card'
              style={{
                borderLeft: `4px solid ${config.color}`
              }}
            >
              {/* Card Header */}
              <div className='company-card-header'>
                <h3>{app.company?.name || 'N/A'}</h3>
                <span style={{
                  background: config.bg,
                  color: config.color,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  border: `1px solid ${config.color}`
                }}>
                  {config.icon} {config.label}
                </span>
              </div>

              {/* Card Details */}
              <div className='company-card-details'>
                <p>
                  <strong>Role:</strong> {app.company?.role || 'N/A'}
                </p>
                <p>
                  <strong>Package:</strong> {app.company?.package || 'N/A'}
                </p>
                <p>
                  <strong>Applied On:</strong> {formatDate(app.appliedAt)}
                </p>
              </div>

              {/* Timeline Toggle */}
              <button
                onClick={() => toggleExpand(app._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  padding: '5px 0',
                  marginTop: '10px'
                }}
              >
                {isExpanded ? '▲ Hide Timeline' : '▼ View Timeline'}
              </button>

              {/* Timeline Section */}
              {isExpanded && (
                <div style={{
                  marginTop: '15px',
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    marginBottom: '20px',
                    color: '#2c3e50',
                    fontSize: '14px'
                  }}>
                    Application Journey
                  </h4>

                  {app.timeline && app.timeline.length > 0 ? (
                    <div style={{
                      position: 'relative',
                      paddingLeft: '30px'
                    }}>
                      {app.timeline.map((entry, index) => {
                        const cfg = statusConfig[entry.status] ||
                          statusConfig.applied
                        const isLast = index === app.timeline.length - 1

                        return (
                          <div
                            key={index}
                            style={{
                              position: 'relative',
                              paddingBottom: isLast ? '0' : '25px'
                            }}
                          >
                            {/* Connecting Line */}
                            {!isLast && (
                              <div style={{
                                position: 'absolute',
                                left: '-22px',
                                top: '20px',
                                width: '2px',
                                height: '100%',
                                background: '#ddd'
                              }} />
                            )}

                            {/* Status Dot */}
                            <div style={{
                              position: 'absolute',
                              left: '-30px',
                              top: '2px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: cfg.color,
                              border: '3px solid white',
                              boxShadow: `0 0 0 2px ${cfg.color}`
                            }} />

                            <p style={{
                              fontWeight: 'bold',
                              color: cfg.color,
                              marginBottom: '3px',
                              fontSize: '14px'
                            }}>
                              {cfg.icon} {cfg.label}
                            </p>
                            <p style={{
                              color: '#7f8c8d',
                              fontSize: '12px',
                              margin: 0
                            }}>
                              {entry.date
                                ? new Date(entry.date).toLocaleString()
                                : 'Date not available'}
                            </p>
                          </div>
                        )
                      })}

                      {/* Pending Next Step */}
                      {app.status !== 'rejected' &&
                       app.status !== 'selected' && (
                        <div style={{ paddingTop: '5px' }}>
                          <div style={{
                            position: 'absolute',
                            left: '0px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#ddd',
                            border: '3px solid white',
                            boxShadow: '0 0 0 2px #ddd'
                          }} />
                          <p style={{
                            fontWeight: 'bold',
                            color: '#bbb',
                            marginLeft: '0'
                          }}>
                            ⏳ Next step pending...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: '#7f8c8d', fontSize: '13px' }}>
                      Timeline data not available
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </Layout>
  )
}

export default Applications