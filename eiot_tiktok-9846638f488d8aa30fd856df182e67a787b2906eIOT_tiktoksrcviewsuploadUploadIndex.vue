
/* 用户视频列表样式 */
.video-list-section {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(230, 243, 255, 0.6), rgba(240, 248, 255, 0.6));
}

.video-list-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-weight: 600;
}

.user-videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.user-video-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.user-video-item:hover {
  transform: translateY(-2px);
}

.video-thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.video-title {
  margin: 8px 0;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-stats {
  margin: 0 0 8px 0;
  padding: 0 8px;
  font-size: 12px;
  color: #666;
}

