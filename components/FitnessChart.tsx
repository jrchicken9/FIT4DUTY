import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface FitnessChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'line';
  height?: number;
  showValues?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

export default function FitnessChart({ 
  data, 
  title, 
  type, 
  height = 200, 
  showValues = true 
}: FitnessChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = height - 60; // Leave space for labels

  const renderBarChart = () => {
    const barWidth = (chartWidth - 40) / data.length - 8;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (chartHeight - 40) : 0;
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  {showValues && item.value > 0 && (
                    <Text style={styles.valueLabel}>{item.value}</Text>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: item.color || Colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const pointWidth = (chartWidth - 40) / (data.length - 1);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          <View style={styles.lineChartContainer}>
            {data.map((item, index) => {
              const pointY = maxValue > 0 ? chartHeight - 40 - (item.value / maxValue) * (chartHeight - 60) : chartHeight - 40;
              const pointX = index * pointWidth;
              
              return (
                <View key={index}>
                  <View
                    style={[
                      styles.point,
                      {
                        left: pointX - 4,
                        top: pointY - 4,
                        backgroundColor: item.color || Colors.primary,
                      },
                    ]}
                  />
                  {showValues && (
                    <Text
                      style={[
                        styles.pointValue,
                        {
                          left: pointX - 15,
                          top: pointY - 25,
                        },
                      ]}
                    >
                      {item.value}
                    </Text>
                  )}
                  {index < data.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        {
                          left: pointX + 4,
                          top: pointY,
                          width: pointWidth - 8,
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                (maxValue > 0 ? chartHeight - 40 - (data[index + 1].value / maxValue) * (chartHeight - 60) : chartHeight - 40) - pointY,
                                pointWidth
                              )}rad`,
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.xAxisLabels}>
            {data.map((item, index) => (
              <Text key={index} style={styles.xAxisLabel}>
                {item.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return type === 'bar' ? renderBarChart() : renderLineChart();
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    position: 'relative',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginBottom: 8,
  },
  bar: {
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  lineChartContainer: {
    position: 'relative',
    flex: 1,
  },
  point: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pointValue: {
    position: 'absolute',
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    width: 30,
    textAlign: 'center',
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    transformOrigin: 'left center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
});