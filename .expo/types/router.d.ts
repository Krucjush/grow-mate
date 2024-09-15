/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/login` | `/(tabs)/logout` | `/(tabs)/plants` | `/(tabs)/register` | `/(tabs)/userGarden` | `/(tabs)\userGarden` | `/..\src\App` | `/..\src\app\(tabs)\` | `/..\src\app\(tabs)\_layout` | `/..\src\app\(tabs)\addPlantForm` | `/..\src\app\(tabs)\login` | `/..\src\app\(tabs)\logout` | `/..\src\app\(tabs)\plants` | `/..\src\app\(tabs)\register` | `/..\src\app\(tabs)\userGarden` | `/..\src\app\+html` | `/..\src\app\+not-found` | `/..\src\app\API\API` | `/..\src\app\_layout` | `/..\src\components\AuthContext` | `/..\src\components\Collapsible` | `/..\src\components\ParallaxScrollView` | `/..\src\components\ThemedText` | `/..\src\components\ThemedView` | `/..\src\components\navigation\RootNavigator` | `/..\src\components\navigation\TabBarIcon` | `/..\src\components\navigation\TabNavigator` | `/..\src\components\navigation\types` | `/..\src\constants\Colors` | `/..\src\hooks\useColorScheme` | `/..\src\hooks\useColorScheme.web` | `/..\src\hooks\useThemeColor` | `/API/API` | `/_sitemap` | `/login` | `/logout` | `/plants` | `/register` | `/userGarden`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
