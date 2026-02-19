import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

const HomePage = lazy(() => import('./pages/HomePage'))
const BooksPage = lazy(() => import('./pages/BooksPage'))
const ChaptersPage = lazy(() => import('./pages/ChaptersPage'))
const ReadPage = lazy(() => import('./pages/ReadPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const SavedPage = lazy(() => import('./pages/SavedPage'))
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50dvh]">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/books" element={<Layout showNav={false}><BooksPage /></Layout>} />
              <Route path="/books/:bookId" element={<Layout showNav={false}><ChaptersPage /></Layout>} />
              <Route path="/read/:bookId?/:chapter?" element={<Layout showNav={false}><ReadPage /></Layout>} />
              <Route path="/search" element={<Layout><SearchPage /></Layout>} />
              <Route path="/saved" element={<Layout><SavedPage /></Layout>} />
              <Route path="/favorites" element={<Layout><SavedPage /></Layout>} />
              <Route path="/notes" element={<Layout><SavedPage /></Layout>} />
              <Route path="/highlights" element={<Layout><HighlightsPage /></Layout>} />
              <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}
