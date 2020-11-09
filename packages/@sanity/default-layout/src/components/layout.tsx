import {Box, Flex, Layer, LayerProvider, Theme} from '@sanity/ui'
import absolutes from 'all:part:@sanity/base/absolutes'
import AppLoadingScreen from 'part:@sanity/base/app-loading-screen'
import {RouteScope, useRouterState} from 'part:@sanity/base/router'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import styled, {css, keyframes} from 'styled-components'
import {Sidecar} from '../lib/__experimental_sidecar'
import {getNewDocumentModalActions} from '../lib/new-document'
import {getOrderedTools} from '../lib/tool'
import {CreateDocumentDialog} from './createDocumentDialog'
import {Navbar} from './navbar'
import {SchemaErrorReporter} from './schemaErrors'
import {SideMenu} from './sideMenu'
import {RenderTool} from './tool'

const Root = styled(Flex)`
  height: 100%;

  @media (min-width: ${({theme}) => theme.media[0]}) {
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
`

const ToolContainer = styled(Box)`
  position: relative;
  height: 100%;
  margin-top: 0;
  margin-left: env(safe-area-inset-left);
  margin-right: env(safe-area-inset-right);

  @media (min-width: ${({theme}) => theme.media[0]}) {
    overflow: auto;
  }
`

const NavbarContainer = styled(Layer)`
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
`

const loadingScreen = keyframes`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`

const LoadingScreenContainer = styled(Layer)`
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 1;
  transition: opacity 0.5s linear;
  animation-name: ${loadingScreen};
  animation-duration: 1s;
  animation-delay: 1s;
`

const SidecarContainer = styled.div(({theme}: {theme: Theme}) => {
  const {media} = theme

  return css`
    &:empty {
      display: none;
    }

    @media (max-width: ${media[0] - 1}px) {
      display: none;
    }
  `
})

export function Layout() {
  const tools = getOrderedTools()
  const routerState = useRouterState()
  const [createMenuIsOpen, setCreateMenuIsOpen] = useState(false)
  const [sidemenuIsOpen, setSidemenuIsOpen] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [searchIsOpen, setSearchIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const loadingScreenElementRef = useRef<HTMLDivElement | null>(null)
  const loadingScreenHidden = loaded || document.visibilityState === 'hidden'

  const handleAnimationEnd = useCallback(() => setShowLoadingScreen(false), [])
  const handleCreateButtonClick = useCallback(() => setCreateMenuIsOpen(val => !val), [])
  const handleActionModalClose = useCallback(() => setCreateMenuIsOpen(false), [])
  const handleSidemenuOpen = useCallback(() => setSidemenuIsOpen(true), [])
  const handleSidemenuClose = useCallback(() => setSidemenuIsOpen(false), [])
  const handleSearchOpen = useCallback(() => setSearchIsOpen(true), [])
  const handleSearchClose = useCallback(() => setSearchIsOpen(false), [])

  // Subscribe to `animationend`
  useEffect(() => {
    const loadingScreenElement = loadingScreenElementRef.current

    if (loadingScreenElement && showLoadingScreen) {
      loadingScreenElement.addEventListener('animationend', handleAnimationEnd)
    }

    return () => {
      if (loadingScreenElement) {
        loadingScreenElement.removeEventListener('animationend', handleAnimationEnd)
      }
    }
  }, [handleAnimationEnd, showLoadingScreen])

  // Set loaded state after first render
  useEffect(() => {
    if (!loaded) setLoaded(true)
  }, [loaded])

  return (
    <SchemaErrorReporter>
      {() => (
        <Root direction="column">
          {showLoadingScreen && (
            <LayerProvider baseDepth={10000} id="loader">
              <LoadingScreenContainer hidden={loadingScreenHidden} ref={loadingScreenElementRef}>
                <AppLoadingScreen text="Restoring Sanity" />
              </LoadingScreenContainer>
            </LayerProvider>
          )}

          <LayerProvider baseDepth={1000} id="navbar">
            <NavbarContainer>
              <Navbar
                tools={tools}
                createMenuIsOpen={createMenuIsOpen}
                onCreateButtonClick={handleCreateButtonClick}
                onSidemenuOpen={handleSidemenuOpen}
                onSidemenuClose={handleSidemenuClose}
                searchIsOpen={searchIsOpen}
                onSearchOpen={handleSearchOpen}
                onSearchClose={handleSearchClose}
              />
            </NavbarContainer>
          </LayerProvider>

          <LayerProvider baseDepth={2000} id="sidemenu">
            <SideMenu
              activeToolName={routerState?.tool}
              onClose={handleSidemenuClose}
              open={sidemenuIsOpen}
              tools={tools}
            />
          </LayerProvider>

          <Flex flex={1}>
            <LayerProvider id="content">
              <ToolContainer flex={1}>
                <RouteScope scope={routerState?.tool}>
                  <RenderTool tool={routerState?.tool} />
                </RouteScope>
              </ToolContainer>
            </LayerProvider>

            <LayerProvider id="sidecar" baseDepth={500}>
              <SidecarContainer>
                <Sidecar />
              </SidecarContainer>
            </LayerProvider>
          </Flex>

          {createMenuIsOpen && (
            <LayerProvider baseDepth={1500} id="new-document">
              <CreateDocumentDialog
                onClose={handleActionModalClose}
                actions={getNewDocumentModalActions()}
              />
            </LayerProvider>
          )}

          {absolutes.map((Abs, i) => (
            <Abs key={String(i)} />
          ))}
        </Root>
      )}
    </SchemaErrorReporter>
  )
}