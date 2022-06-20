import { LectureSyncInfo } from "../entities/lecture_sync_info.entity";

type SyncInfos = (LectureSyncInfo & {newCount? : number, updatedCount? : number, removedCount? : number, hasChanges?: boolean})


export const syncCensurer = (syncs : SyncInfos[]) : SyncInfos[] => {

  syncs.forEach(si => {
    if (si.newLectures) {
      si.newLectures.forEach(l => {
        l.lecturer = undefined;
      });
    }
    if (si.removedLectures) {
      si.removedLectures.forEach(l => {
        l.lecturer = undefined;
      });
    }
    if (si.updatedLectures) {
      si.updatedLectures.forEach(l => {
        l.lecture.lecturer = undefined;
        l.changeInfos.find(ci => {
          if (ci.fieldName === "lecturer") {
            ci.value = `**censored** (${ci.value.length})`
            ci.previousValue = `**censored** (${ci.previousValue.length})`
          }
        })
      })
    }
  })

  return syncs;
}

export const syncCensurerSingleton = (sync : SyncInfos) : SyncInfos => {
  if (sync.newLectures) {
    sync.newLectures.forEach(l => {
      l.lecturer = undefined;
    });
  }
  if (sync.removedLectures) {
    sync.removedLectures.forEach(l => {
      l.lecturer = undefined;
    });
  }
  if (sync.updatedLectures) {
    sync.updatedLectures.forEach(l => {
      l.lecture.lecturer = undefined;
      l.changeInfos.find(ci => {
        if (ci.fieldName === "lecturer") {
          ci.value = `**censored** (${ci.value.length})`
          ci.previousValue = `**censored** (${ci.previousValue.length})`
        }
      })
    })
  }

  return sync;
}